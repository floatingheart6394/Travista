import Hero from "../components/Hero";
import Plan from "../components/Plan";
import Budget from "../components/Budget";
import Tavi from "../components/Tavi";
import Emergency from "../components/Emergency";
import CustomCursor from "../components/CustomCursor";
import Exploria from "../components/Exploria";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Hero />
      <Plan />
      <Budget />
      <Tavi />
      <Emergency />
      <Exploria />
      <Footer />
    </>
  );
}
