import AdvancedDft from "@/modules/Home/SubTypes/AdvancedDft";
import type { HomeState } from "@/modules/Home/useHome";

const Octopus = (homeState: HomeState) => (
	<AdvancedDft {...homeState} simulator="Octopus" />
);

export default Octopus;
