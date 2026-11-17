import { FOUNDER } from '@/lib/siteStats';

// Photo when FOUNDER.photoUrl is set, initials otherwise.
export default function FounderAvatar({ className = '' }: { className?: string }) {
  if (FOUNDER.photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={FOUNDER.photoUrl} alt={FOUNDER.name} className={`object-cover ${className}`} />;
  }
  return (
    <div className={`bg-[#E8522A] text-white flex items-center justify-center font-black ${className}`}>
      {FOUNDER.initials}
    </div>
  );
}
