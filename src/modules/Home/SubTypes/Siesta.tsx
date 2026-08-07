import AdvancedDft from "@/modules/Home/SubTypes/AdvancedDft";
import type { HomeState } from "@/modules/Home/useHome";

const Siesta = (homeState: HomeState) => (
	<AdvancedDft {...homeState} simulator="Siesta" />
);

export default Siesta;
