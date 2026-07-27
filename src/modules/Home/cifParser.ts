const ELEMENT_SYMBOLS = new Set([
	"H",
	"He",
	"Li",
	"Be",
	"B",
	"C",
	"N",
	"O",
	"F",
	"Ne",
	"Na",
	"Mg",
	"Al",
	"Si",
	"P",
	"S",
	"Cl",
	"Ar",
	"K",
	"Ca",
	"Sc",
	"Ti",
	"V",
	"Cr",
	"Mn",
	"Fe",
	"Co",
	"Ni",
	"Cu",
	"Zn",
	"Ga",
	"Ge",
	"As",
	"Se",
	"Br",
	"Kr",
	"Rb",
	"Sr",
	"Y",
	"Zr",
	"Nb",
	"Mo",
	"Tc",
	"Ru",
	"Rh",
	"Pd",
	"Ag",
	"Cd",
	"In",
	"Sn",
	"Sb",
	"Te",
	"I",
	"Xe",
	"Cs",
	"Ba",
	"La",
	"Ce",
	"Pr",
	"Nd",
	"Pm",
	"Sm",
	"Eu",
	"Gd",
	"Tb",
	"Dy",
	"Ho",
	"Er",
	"Tm",
	"Yb",
	"Lu",
	"Hf",
	"Ta",
	"W",
	"Re",
	"Os",
	"Ir",
	"Pt",
	"Au",
	"Hg",
	"Tl",
	"Pb",
	"Bi",
	"Po",
	"At",
	"Rn",
	"Fr",
	"Ra",
	"Ac",
	"Th",
	"Pa",
	"U",
	"Np",
	"Pu",
	"Am",
	"Cm",
	"Bk",
	"Cf",
	"Es",
	"Fm",
	"Md",
	"No",
	"Lr",
	"Rf",
	"Db",
	"Sg",
	"Bh",
	"Hs",
	"Mt",
	"Ds",
	"Rg",
	"Cn",
	"Nh",
	"Fl",
	"Mc",
	"Lv",
	"Ts",
	"Og",
]);

const TYPE_SYMBOL_HEADER = "_atom_site_type_symbol";
const ATOM_LABEL_HEADER = "_atom_site_label";
const TYPE_SYMBOL_WARNING = "";
const LABEL_WARNING =
	"Elements were detected from atom labels because _atom_site_type_symbol was not present. Please review them before running.";
const INLINE_LABEL_WARNING =
	"Elements were detected from non-loop atom labels. Please review them before running.";
const NO_ELEMENTS_WARNING =
	"Could not detect atomic elements from this CIF file. Check that it contains atom-site element symbols or labels.";
const DIRECT_ELEMENT_PATTERN = /^([A-Z][a-z]?)(?:[0-9_+\-.].*)?$/;
const RELAXED_ELEMENT_PATTERN = /^([A-Za-z]{1,2})(?:[0-9_+\-.].*)?$/;

type ElementCandidates = {
	loopSymbols: string[];
	loopLabels: string[];
	inlineSymbols: string[];
	inlineLabels: string[];
};

export type CifElementParseResult = {
	elements: string[];
	warning: string;
};

export const extractElementsFromCifFile = async (
	file: File,
): Promise<CifElementParseResult> =>
	extractElementsFromCif(await readCifText(file));

export const normalizeCifFile = async (file: File): Promise<File> => {
	const cifText = await readCifText(file);

	return new File([cifText], file.name, {
		type: file.type || "chemical/x-cif",
		lastModified: file.lastModified,
	});
};

const readCifText = async (file: File) =>
	(await file.text()).replace(/^\uFEFF/, "");

export const extractElementsFromCif = (
	cifText: string,
): CifElementParseResult => {
	const tokens = tokenizeCif(cifText);
	const candidates = collectElementCandidates(tokens);

	if (candidates.loopSymbols.length > 0) {
		return {
			elements: uniqueSorted(candidates.loopSymbols),
			warning: TYPE_SYMBOL_WARNING,
		};
	}

	if (candidates.loopLabels.length > 0) {
		return {
			elements: uniqueSorted(candidates.loopLabels),
			warning: LABEL_WARNING,
		};
	}

	if (candidates.inlineSymbols.length > 0) {
		return {
			elements: uniqueSorted(candidates.inlineSymbols),
			warning: TYPE_SYMBOL_WARNING,
		};
	}

	if (candidates.inlineLabels.length > 0) {
		return {
			elements: uniqueSorted(candidates.inlineLabels),
			warning: INLINE_LABEL_WARNING,
		};
	}

	return {
		elements: [],
		warning: NO_ELEMENTS_WARNING,
	};
};

const tokenizeCif = (text: string) => {
	const tokens: string[] = [];
	const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
	let inMultiline = false;
	let multilineValue = "";

	for (const rawLine of lines) {
		if (rawLine.startsWith(";")) {
			if (inMultiline) {
				tokens.push(multilineValue.trim());
				multilineValue = "";
				inMultiline = false;
			} else {
				inMultiline = true;
			}
			continue;
		}

		if (inMultiline) {
			multilineValue += `${rawLine}\n`;
			continue;
		}

		for (const token of tokenizeCifLine(stripComment(rawLine))) {
			tokens.push(token);
		}
	}

	return tokens;
};

const stripComment = (line: string) => {
	let quote: string | null = null;

	for (let index = 0; index < line.length; index += 1) {
		const character = line[index];

		if (
			(character === "'" || character === '"') &&
			(index === 0 || line[index - 1] !== "\\")
		) {
			quote = quote === character ? null : quote || character;
			continue;
		}

		if (character === "#" && !quote) {
			return line.slice(0, index);
		}
	}

	return line;
};

const tokenizeCifLine = (line: string) => {
	const tokens: string[] = [];
	let token = "";
	let quote: string | null = null;

	for (const character of line.trim()) {
		if ((character === "'" || character === '"') && !quote) {
			quote = character;
			continue;
		}

		if (character === quote) {
			quote = null;
			continue;
		}

		if (/\s/.test(character) && !quote) {
			if (token) {
				tokens.push(token);
				token = "";
			}
			continue;
		}

		token += character;
	}

	if (token) {
		tokens.push(token);
	}

	return tokens;
};

const collectElementCandidates = (tokens: string[]): ElementCandidates => {
	const candidates: ElementCandidates = {
		loopSymbols: [],
		loopLabels: [],
		inlineSymbols: [],
		inlineLabels: [],
	};
	let index = 0;

	while (index < tokens.length) {
		const token = tokens[index] ?? "";
		const normalizedToken = token.toLowerCase();

		if (normalizedToken === TYPE_SYMBOL_HEADER) {
			addCandidate(candidates.inlineSymbols, tokens[index + 1]);
			index += 1;
			continue;
		}

		if (normalizedToken === ATOM_LABEL_HEADER) {
			addCandidate(candidates.inlineLabels, tokens[index + 1]);
			index += 1;
			continue;
		}

		if (normalizedToken !== "loop_") {
			index += 1;
			continue;
		}

		index += 1;
		const headers: string[] = [];

		while (index < tokens.length && tokens[index]?.startsWith("_")) {
			headers.push(tokens[index]?.toLowerCase() ?? "");
			index += 1;
		}

		const rowWidth = headers.length;
		const symbolColumn = headers.indexOf(TYPE_SYMBOL_HEADER);
		const labelColumn = headers.indexOf(ATOM_LABEL_HEADER);

		if (rowWidth === 0) {
			continue;
		}

		while (index < tokens.length && !isDataBlockBoundary(tokens[index])) {
			if (index + rowWidth > tokens.length) {
				break;
			}

			if (symbolColumn >= 0) {
				addCandidate(candidates.loopSymbols, tokens[index + symbolColumn]);
			}

			if (labelColumn >= 0) {
				addCandidate(candidates.loopLabels, tokens[index + labelColumn]);
			}

			index += rowWidth;
		}
	}

	return candidates;
};

const isDataBlockBoundary = (token = "") => {
	const normalizedToken = token.toLowerCase();

	return (
		token.startsWith("_") ||
		normalizedToken === "loop_" ||
		normalizedToken === "stop_" ||
		normalizedToken === "global_" ||
		normalizedToken.startsWith("data_") ||
		normalizedToken.startsWith("save_")
	);
};

const addCandidate = (candidates: string[], value?: string) => {
	const element = normalizeElementToken(value);

	if (element) {
		candidates.push(element);
	}
};

const normalizeElementToken = (value = "") => {
	const cleaned = value
		.trim()
		.replace(/^['"]|['"]$/g, "")
		.replace(/^\[|\]$/g, "");
	const directMatch = cleaned.match(DIRECT_ELEMENT_PATTERN);
	const relaxedMatch = cleaned.match(RELAXED_ELEMENT_PATTERN);
	const candidate = directMatch?.[1] || normalizeCase(relaxedMatch?.[1] || "");

	return candidate && ELEMENT_SYMBOLS.has(candidate) ? candidate : "";
};

const normalizeCase = (value: string) =>
	value ? `${value[0]?.toUpperCase()}${value.slice(1).toLowerCase()}` : "";

const uniqueSorted = (values: string[]) =>
	[...new Set(values)].sort((left, right) => left.localeCompare(right));
