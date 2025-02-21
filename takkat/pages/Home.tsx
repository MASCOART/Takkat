import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './home/Comp/navbar';
import Hero from './home/Comp/hero';
import CategoriesSection from './home/Comp/categories-section';
import TopSeller from './home/Comp/Topseller';


const Home: React.FC = () => {
  return (
    <div>
    <Navbar/>
    <Hero/>
<CategoriesSection/>
<TopSeller/>
    </div>


  );
};

export default Home;