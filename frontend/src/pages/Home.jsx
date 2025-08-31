import CardContainer from "../components/CardContainer"
import Hero from "../components/Hero"
import HowItWorks from "../components/HowItWorks"


function Home() {
  return (
     <div className="bg-gradient-to-r from-[#03070e] to-[#050448] min-h-screen w-full text-white font-poppins">
      <Hero/>
      <CardContainer/>
      <HowItWorks/>
    </div>
  )
}

export default Home
