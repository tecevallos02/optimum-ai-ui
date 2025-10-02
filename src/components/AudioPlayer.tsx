interface AudioPlayerProps {
  audioUrl: string;
}
export default function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Recording</h4>
      <audio controls src={audioUrl} className="w-full" />
    </div>
  );
}
