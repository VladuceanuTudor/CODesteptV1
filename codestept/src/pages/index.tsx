import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import Topbar from "@/components/Topbar/Topbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Home() {
  return (
   
      <main className='bg-dark-layer-1 min-h-screen'>
        <Topbar  /> 

        <ProblemsTable />
        {/* <ProblemsTable setLoadingProblems={setLoadingProblems} /> */}
				
      </main>
        
  );
}
