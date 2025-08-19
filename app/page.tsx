import WarpFbmBackground from "@/components/ui/warp-fbm-background";
import { TerminalTypewriter } from "@/components/ui/terminal-typewriter";

export default function Home() {
  const terminalQA = [
    {
      question: "whoami",
      answer: "Surya Narayanan"
    },
    {
      question: "cat /proc/occupation",
      answer: "Senior Software Engineer at WareIQ"
    },
    {
      question: "ls -la /skills/languages/",
      answer: "Golang, Python, TypeScript"
    },
    {
      question: "cat /interests/current.txt",
      answer: "DevOps, Design, Software Architecture"
    },
    {
      question: "tail -f /learning/now.log",
      answer: "Learning circuits and embedded systems"
    }
  ];

  return (
    <>
      {/* Full-screen Warp fBM Shader Background - only visible in dark mode */}
      <WarpFbmBackground className="dark:block hidden" />

      {/* Content */}
      <div className="flex flex-col gap-20 md:gap-28 lg:gap-32">
        {/* Hero Section */}
        <section className="relative flex flex-col items-start justify-center gap-8 py-16 md:py-20 lg:py-24 pl-8 md:pl-16 lg:pl-24">
          <div className="relative z-10">
            <TerminalTypewriter 
              qaItems={terminalQA}
              typeSpeed={12}
              questionDelay={1500}
              answerDelay={800}
              className="text-lg md:text-xl lg:text-2xl leading-relaxed"
            />
          </div>
        </section>
      </div>
    </>
  );
}
