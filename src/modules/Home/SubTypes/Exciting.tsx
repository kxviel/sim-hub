import AdvancedDft from "@/modules/Home/SubTypes/AdvancedDft";
import type { HomeState } from "@/modules/Home/useHome";

const Exciting = (homeState: HomeState) => (
	<AdvancedDft {...homeState} simulator="Exciting" />
);

export default Exciting;
