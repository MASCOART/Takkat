import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './home/Comp/navbar';
import Hero from './home/Comp/hero';
import CategoriesSection from './home/Comp/categories-section';


const Home: React.FC = () => {
  return (
    <div>
    <Navbar/>
    <Hero/>
<CategoriesSection/>
    </div>


  );
};

export default Home;