import { useState } from "react";
import Split from "react-split";
import ProblemDescription from "./ProblemDescription/ProblemDescription";
import Playground from "./Playground/Playground";
import { Problem } from "@/utils/types/problem";
import Confetti from "react-confetti";
import useWindowSize from "@/Hooks/useWindowSize";
import { ToastContainer } from "react-toastify";


type WorkspaceProps = {
	problem: Problem;
};

const Workspace: React.FC<WorkspaceProps> = ({ problem }) => {
	const { width, height } = useWindowSize();
	const [success, setSuccess] = useState(false);
	const [solved, setSolved] = useState(false);

	return (
		<div>
			<ToastContainer />
		
		<Split className='split' minSize={0}>
			{/* <ProblemDescription problem={problem} _solved={solved} /> */}
			
			<ProblemDescription />
			<div className='bg-dark-layer-1'>
				<Playground  setSuccess={setSuccess} setSolved={setSolved} />
				{success && <Confetti gravity={0.3} tweenDuration={4000} width={width - 1} height={height - 1} />}
			</div>
		</Split>
		</div>
	);
};
export default Workspace;