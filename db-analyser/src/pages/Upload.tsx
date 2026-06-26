import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SupportedFormats from "@/components/upload/SupportedFormats";
import RecentUploads from "@/components/upload/RecentUploads";

export default function Upload() {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast.success("Database selected successfully.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  async function handleUpload() {
   if (!file) {
     toast.error("Please select a database first.");
     return;
   }

   const allowedExtensions = [
    "csv",
    "db",
    "sqlite",
    "sql",
    "xls",
    "xlsx",
   ];

   const extension = file.name.split(".").pop()?.toLowerCase();

   if (!extension || !allowedExtensions.includes(extension)) {
     toast.error("Unsupported file type.");
     return;
   }

   setUploading(true);
   setProgress(0);

   for (let i = 0; i <= 100; i += 5) {
     await new Promise((resolve) => setTimeout(resolve, 80));
     setProgress(i);
   }

   toast.success("Database uploaded successfully!");
   setUploading(false);
   setFile(null);

   setTimeout(() => {
     navigate("/dashboard");
   }, 700);
}

  return (
    <div className="min-h-screen bg-[#09090B] text-white">

      <div className="mx-auto max-w-7xl px-6 py-20">

        {/* Hero */}

        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-6xl font-black">

            Smart{" "}

            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">

              Data Analyzer

            </span>

          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-400">

            Upload your database and allow AI to generate dashboards,
            business insights, SQL queries and validation reports
            automatically.

          </p>

        </motion.div>

        {/* Upload Card */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.01,
          }}
          className="mx-auto mt-16 max-w-4xl rounded-3xl border border-violet-800/30 bg-[#111118] p-10 shadow-[0_0_60px_rgba(124,58,237,0.15)]"
        >

          <div
            {...getRootProps({
              disabled: uploading,
            })}
            className={`cursor-pointer rounded-3xl border-2 border-dashed p-14 text-center transition

            ${
              isDragActive
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-violet-700/40 bg-[#0E0D14]"
            }`}
          >

            <input {...getInputProps()} />

            <UploadCloud
              size={70}
              className="mx-auto text-cyan-400"
            />

            <h2 className="mt-6 text-3xl font-bold">

              Drag & Drop Database

            </h2>

            <p className="mt-3 text-gray-400">

              CSV • SQLite • SQL • Excel

            </p>

            {file && (

              <div className="mt-8 flex items-center justify-center gap-3 rounded-xl bg-[#171620] p-4">

                <FileText className="text-cyan-400" />

                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

              </div>

            )}

          </div>

          {/* Upload Progress */}

          {uploading && (

            <div className="mt-8">

              <div className="mb-2 flex justify-between">

                <span>Uploading...</span>

                <span>{progress}%</span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#232331]">

                <div
                  style={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300 ease-in-out"
                />

              </div>

            </div>

          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-10 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 py-7 text-lg hover:opacity-90"
          >

            {uploading
             ? `Uploading ${progress}%`
             : "Upload Database"}

            <ArrowRight className="ml-3" />

          </Button>

        </motion.div>

        {/* Supported Formats */}

        <SupportedFormats />  
        <RecentUploads />  

      </div>

    </div>
  );
}
