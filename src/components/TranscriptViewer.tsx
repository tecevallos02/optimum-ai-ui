interface TranscriptViewerProps {
  transcriptUrl: string;
}
export default function TranscriptViewer({
  transcriptUrl,
}: TranscriptViewerProps) {
  // In mock mode we just fetch the text file from /public
  return (
    <div>
      <h4 className="font-semibold mb-2">Transcript</h4>
      <pre className="bg-bg p-4 rounded overflow-x-auto whitespace-pre-wrap">
        Loading transcript from {transcriptUrl}...
      </pre>
    </div>
  );
}
