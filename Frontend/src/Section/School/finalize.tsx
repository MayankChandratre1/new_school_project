import { Button } from "@/components/ui/button"
import EducationYearChart from "./component/new-chart"
import { useEffect, useState } from "react"
import { getStudents } from "@/api"
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as htmlToImage from 'html-to-image'
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

const Finalize = () => {
  const [studentId, setStudentId] = useState<string>("")
  const [students, setStudents] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedPDFs, setGeneratedPDFs] = useState<{ fileName: string, pdf: jsPDF }[]>([])
  const { toast } = useToast()

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const generatePDF = async (student: any) => {
    const doc = new jsPDF()
    doc.text(`Student Report: ${student.name} ${student.email}`, 20, 20)
    doc.text(`Grade: ${student.grade}`, 20, 30)
    
    const barChart = document.getElementById('graph')
    if (barChart) {
      const src = await htmlToImage.toPng(barChart)
      doc.text('Points Summary', 20, 50)
      doc.addImage(src, 'PNG', 15, 60, 180, 100)
      return {
        fileName: `${student.name}_report.pdf`,
        pdf: doc
      }
    }
    return null
  }

  const generateAllReports = async () => {
    setIsGenerating(true)
    setProgress(0)
    setGeneratedPDFs([])
    
    const pdfs = []
    for (let i = 0; i < students.length; i++) {
      // Update student ID and wait for chart to update
      setStudentId(students[i]._id)
      await delay(2000) // Wait for chart to update

      // Generate PDF
      const pdf = await generatePDF(students[i])
      if (pdf) pdfs.push(pdf)

      // Update progress
      setProgress(((i + 1) / students.length) * 100)
    }

  
    setGeneratedPDFs(pdfs)
    console.log(generatedPDFs[0]);
    

    for (const pdf of pdfs) {
      pdf.pdf.save(pdf.fileName)
      await delay(500) 
    }

    setIsGenerating(false)
    setProgress(0)
    
    toast({
      title: "Success",
      description: `Generated ${pdfs.length} reports successfully`,
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")
      const resTeacher = await getStudents(token ?? "")
      setStudents(resTeacher.students)
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <h1 className="text-4xl font-bold text-center">
        Finalize the Current School Year
      </h1>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        {isGenerating && (
          <div className="w-full space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-gray-500">
              Generating reports... {Math.round(progress)}%
            </p>
          </div>
        )}

        <Button 
          className="bg-[#00a58c] hover:bg-[#00a58c] h-16 text-lg"
          onClick={generateAllReports}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating Reports...' : 'Generate Reports'}
        </Button>

        <Button 
          variant="destructive"
          className="h-16 text-lg"
          disabled={isGenerating}
          onClick={() => {
            console.log("Reset Student Roster clicked")
          }}
        >
          Reset Student Roster
        </Button>
      </div>

      <div>
        <EducationYearChart studentId={studentId} />
      </div>
    </div>
  )
}

export default Finalize