import CardContainer from "../components/CardContainer"
import Hero from "../components/Hero"
import HowItWorks from "../components/HowItWorks"


function Home() {
  return (
     <div className="bg-[#121212] min-h-screen w-screen text-white font-poppins">
      <Hero/>
      <CardContainer/>
      <HowItWorks/>
    </div>
  )
}

export default Home
