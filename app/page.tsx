import MatrixShaderBackground from "@/components/ui/matrix-shader-background";

export default function Home() {
  return (
    <>
      {/* Full-screen Matrix Shader Background with integrated text */}
      <MatrixShaderBackground
        className="dark:block hidden"
        name="Surya Narayanan"
        title="Senior Software Engineer at WareIQ"
        skills="Golang • Python • TypeScript"
        interests="DevOps • Design • Software Architecture"
      />

      {/* Social Links */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto animate-fade-in-1000">
        <div className="flex items-center gap-6 text-gray-400">
          <a
            href="https://github.com/isuryanarayanan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            GitHub
          </a>
          <span className="text-gray-600">•</span>
          <a
            href="https://instagram.com/0xsuryan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            Instagram
          </a>
          <span className="text-gray-600">•</span>
          <a
            href="https://www.linkedin.com/in/surya-narayanan-25bbb8168/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </>
  );
}
