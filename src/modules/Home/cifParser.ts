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

type CifLoop = {
	headers: string[];
	rows: string[][];
};

export type CifElementParseResult = {
	elements: string[];
	warning: string;
};

export const extractElementsFromCifFile = async (
	file: File,
): Promise<CifElementParseResult> => extractElementsFromCif(await file.text());

export const extractElementsFromCif = (
	cifText: string,
): CifElementParseResult => {
	const tokens = tokenizeCif(cifText);
	const loops = parseCifLoops(tokens);
	const directSymbols = collectFromAtomSiteLoops(
		loops,
		"_atom_site_type_symbol",
	);

	if (directSymbols.length > 0) {
		return { elements: uniqueSorted(directSymbols), warning: "" };
	}

	const labelSymbols = collectFromAtomSiteLoops(loops, "_atom_site_label");

	if (labelSymbols.length > 0) {
		return {
			elements: uniqueSorted(labelSymbols),
			warning:
				"Elements were detected from atom labels because _atom_site_type_symbol was not present. Please review them before running.",
		};
	}

	const inlineSymbols = collectInlineAtomValues(
		tokens,
		"_atom_site_type_symbol",
	);

	if (inlineSymbols.length > 0) {
		return { elements: uniqueSorted(inlineSymbols), warning: "" };
	}

	const inlineLabels = collectInlineAtomValues(tokens, "_atom_site_label");

	if (inlineLabels.length > 0) {
		return {
			elements: uniqueSorted(inlineLabels),
			warning:
				"Elements were detected from non-loop atom labels. Please review them before running.",
		};
	}

	return {
		elements: [],
		warning:
			"Could not detect atomic elements from this CIF file. Check that it contains atom-site element symbols or labels.",
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

const parseCifLoops = (tokens: string[]) => {
	const loops: CifLoop[] = [];
	let index = 0;

	while (index < tokens.length) {
		if (tokens[index]?.toLowerCase() !== "loop_") {
			index += 1;
			continue;
		}

		index += 1;
		const headers: string[] = [];

		while (tokens[index]?.startsWith("_")) {
			headers.push(tokens[index]?.toLowerCase() ?? "");
			index += 1;
		}

		const values: string[] = [];

		while (
			index < tokens.length &&
			!tokens[index]?.startsWith("_") &&
			tokens[index]?.toLowerCase() !== "loop_" &&
			!tokens[index]?.startsWith("data_")
		) {
			const value = tokens[index];

			if (value) {
				values.push(value);
			}
			index += 1;
		}

		if (headers.length > 0) {
			const rows: string[][] = [];

			for (
				let rowIndex = 0;
				rowIndex < values.length;
				rowIndex += headers.length
			) {
				rows.push(values.slice(rowIndex, rowIndex + headers.length));
			}

			loops.push({ headers, rows });
		}
	}

	return loops;
};

const collectFromAtomSiteLoops = (loops: CifLoop[], targetHeader: string) => {
	const symbols: string[] = [];

	for (const loop of loops) {
		const headerIndex = loop.headers.indexOf(targetHeader);

		if (
			headerIndex === -1 ||
			!loop.headers.some((header) => header.startsWith("_atom_site_"))
		) {
			continue;
		}

		for (const row of loop.rows) {
			const symbol = normalizeElementToken(row[headerIndex]);

			if (symbol) {
				symbols.push(symbol);
			}
		}
	}

	return symbols;
};

const collectInlineAtomValues = (tokens: string[], targetHeader: string) => {
	const symbols: string[] = [];

	for (let index = 0; index < tokens.length; index += 1) {
		if (tokens[index]?.toLowerCase() !== targetHeader) {
			continue;
		}

		const symbol = normalizeElementToken(tokens[index + 1]);

		if (symbol) {
			symbols.push(symbol);
		}
	}

	return symbols;
};

const normalizeElementToken = (value = "") => {
	const cleaned = value
		.trim()
		.replace(/^['"]|['"]$/g, "")
		.replace(/^\[|\]$/g, "");
	const directMatch = cleaned.match(/^([A-Z][a-z]?)(?:[0-9_+\-.].*)?$/);
	const relaxedMatch = cleaned.match(/^([A-Za-z]{1,2})(?:[0-9_+\-.].*)?$/);
	const candidate = directMatch?.[1] || normalizeCase(relaxedMatch?.[1] || "");

	return candidate && ELEMENT_SYMBOLS.has(candidate) ? candidate : "";
};

const normalizeCase = (value: string) =>
	value ? `${value[0]?.toUpperCase()}${value.slice(1).toLowerCase()}` : "";

const uniqueSorted = (values: string[]) =>
	[...new Set(values)].sort((left, right) => left.localeCompare(right));
