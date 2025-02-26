import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './home/Comp/navbar';
import Hero from './home/Comp/hero';
import CategoriesSection from './home/Comp/categories-section';
import TopSeller from './home/Comp/Topseller';
import Footer from './home/Comp/footer';


const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <CategoriesSection />

      <TopSeller />
      <Footer />
    </div>


  );
};

export default Home;