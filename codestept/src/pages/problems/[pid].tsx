import Topbar from "@/components/Topbar/Topbar";
import Workspace from "@/components/Workspace/Workspace";
// import useHasMounted from "@/hooks/useHasMounted";
//import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";
import React from "react";

type ProblemPageProps = {
	problem: Problem;
};

const ProblemPage: React.FC<ProblemPageProps> = ({ problem }) => {
	// const hasMounted = useHasMounted();

	// if (!hasMounted) return null;

	return (
		<div>
			<Topbar problemPage />
			<Workspace problem={problem} />
		</div>
	);
};
export default ProblemPage;

