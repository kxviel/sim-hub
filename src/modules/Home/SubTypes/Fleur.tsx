import AdvancedDft from "@/modules/Home/SubTypes/AdvancedDft";
import type { HomeState } from "@/modules/Home/useHome";

const Fleur = (homeState: HomeState) => (
	<AdvancedDft {...homeState} simulator="Fleur" />
);

export default Fleur;
