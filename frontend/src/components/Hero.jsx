import { Link } from "react-router-dom";
import heroImg from "../assets/hero2.png"; // adjust path if needed

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-[#03070e] to-[#050448] min-h-[calc(100vh-4rem)] flex items-center py-16">

      <div
        className="grid max-w-screen-xl w-full px-4 py-16 mx-auto lg:gap-8 xl:gap-0 lg:py-24 lg:grid-cols-12"
      // style={{ backgroundImage: `url(${heroImg})` }}
      >
        {/* Left Content */}
        <div className="mr-auto place-self-center lg:col-span-7 text-center lg:text-left bg-black/60 lg:bg-transparent p-6 rounded-xl lg:p-0">
          <h1 className="max-w-2xl mb-6 text-4xl font-extrabold tracking-tight leading-tight md:text-5xl xl:text-6xl text-white">
            Manage & Chat with <br className="hidden md:block" />
            Your Legal Documents
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-300 md:text-lg lg:text-xl">
            Upload, store, and summarize contracts in one place. Ask AI questions
            about your documents and get deadline reminders before it’s too late.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              to="/LegalDocDashboard"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Get Started →
            </Link>
            <Link
              to="#"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white border border-gray-500 rounded-lg hover:bg-gray-800"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Image (desktop only) */}
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex justify-center">
          <img
            src={heroImg}
            alt="mockup"
            className="w-full h-auto max-w-full"
          />
        </div>
      </div>
    </section>
  );
}
