import ToastContainers from "./Utils/ToastContainer";
import PageNotFound404 from "./Errors/PageNotFound404";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Base from "./Pages/Base";
import ScrollToTop from "./Components/ScrollToTop";
import './App.css';

// Pages
import Home from "./Pages/Home";
import SearchCars from "./Pages/SearchCars";
import UsedCars from "./Pages/UsedCars";
import CarDetail from "./Pages/CarDetail";
import UsedCarDetail from "./Pages/UsedCarDetail";
import CompareCars from "./Pages/CompareCars";
import LatestCars from "./Pages/LatestCars";
import PopularCars from "./Pages/PopularCars";
import UpcomingCars from "./Pages/UpcomingCars";
import Blog from "./Pages/Blog";
import BlogSingle from "./Pages/BlogSingle";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import FAQ from "./Pages/FAQ";
import CertifiedCars from "./Pages/CertifiedCars";
import SellCar from "./Pages/SellCar";
import SellBike from "./Pages/SellBike";
import UsedBikes from "./Pages/UsedBikes";
import NewBikes from "./Pages/NewBikes";
import BikeDetail from "./Pages/BikeDetail";
import AutoStore from "./Pages/AutoStore";
import AutoPartDetail from "./Pages/AutoPartDetail";
import SellCarParts from "./Pages/SellCarParts";
import RentCar from "./Pages/RentCar";
import RentCarList from "./Pages/RentCarList";
import BuyCarForMe from "./Pages/BuyCarForMe";
import Auth from "./Pages/Auth";
import Profile from "./Pages/Profile";
import MyAds from "./Pages/MyAds";
import EditAd from "./Pages/EditAd";
import Videos from "./Pages/Videos";
import PriceCalculator from "./Pages/PriceCalculator";
import Inspection from "./Pages/Inspection";
import ListItForYou from "./Pages/ListItForYou";
import DealerPackages from "./Pages/DealerPackages";
import PackageDetail from "./Pages/PackageDetail";
import PaymentReceipt from "./Pages/PaymentReceipt";
import MyPackages from "./Pages/MyPackages";
import BoostAd from "./Pages/BoostAd";
import Help from "./Pages/Help";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import ForgotPassword from "./Pages/ForgotPassword";


function App() {
  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        {/* ToastContainer */}
        <ToastContainers />

        {/* Routes */}
        <Routes>
          {/* Home Routes */}
          <Route path='/' element={<Base><Home /></Base>} />

          {/* Car Search Routes */}
          <Route path='/search-cars' element={<Base><SearchCars /></Base>} />
          <Route path='/latest-cars' element={<Base><LatestCars /></Base>} />
          <Route path='/popular-cars' element={<Base><PopularCars /></Base>} />
          <Route path='/featured-cars' element={<Base><PopularCars /></Base>} />
          <Route path='/upcoming-cars' element={<Base><UpcomingCars /></Base>} />
          <Route path='/certified-cars' element={<Base><CertifiedCars /></Base>} />

          {/* Used Cars Routes */}
          <Route path='/used-cars' element={<Base><UsedCars /></Base>} />
          <Route path='/used-car-detail/:id' element={<Base><UsedCarDetail /></Base>} />
          <Route path='/sell-car' element={<Base><SellCar /></Base>} />
          <Route path='/sell-bike' element={<Base><SellBike /></Base>} />
          <Route path='/rent-car' element={<Base><RentCarList /></Base>} />
          <Route path='/post-rent-car' element={<Base><RentCar /></Base>} />
          <Route path='/buy-car-for-me' element={<Base><BuyCarForMe /></Base>} />

          {/* Bikes Routes */}
          <Route path='/bikes' element={<Base><UsedBikes /></Base>} />
          <Route path='/used-bikes' element={<Base><UsedBikes /></Base>} />
          <Route path='/new-bikes' element={<Base><NewBikes /></Base>} />
          <Route path='/bike-detail/:id' element={<Base><BikeDetail /></Base>} />

          {/* Auto Store Routes */}
          <Route path='/auto-store' element={<Base><AutoStore /></Base>} />
          <Route path='/auto-part-detail/:id' element={<Base><AutoPartDetail /></Base>} />
          <Route path='/sell-car-parts' element={<Base><SellCarParts /></Base>} />

          {/* Car Detail Routes */}
          <Route path='/car-detail/:id' element={<Base><CarDetail /></Base>} />
          <Route path='/compare-cars' element={<Base><CompareCars /></Base>} />

          {/* Blog Routes */}
          <Route path='/blog' element={<Base><Blog /></Base>} />
          <Route path='/blog/:id' element={<Base><BlogSingle /></Base>} />

          {/* Videos Routes */}
          <Route path='/videos' element={<Base><Videos /></Base>} />

          {/* Static Pages */}
          <Route path='/about' element={<Base><About /></Base>} />
          <Route path='/contact' element={<Base><Contact /></Base>} />
          <Route path='/faq' element={<Base><FAQ /></Base>} />
          <Route path='/help' element={<Base><Help /></Base>} />
          <Route path='/privacy-policy' element={<Base><PrivacyPolicy /></Base>} />
          <Route path='/privacy404' element={<Base><PrivacyPolicy /></Base>} />
          <Route path='/privacy' element={<Base><PrivacyPolicy /></Base>} />
          <Route path='/price-calculator' element={<Base><PriceCalculator /></Base>} />
          <Route path='/inspection' element={<Base><Inspection /></Base>} />
          <Route path='/list-it-for-you' element={<Base><ListItForYou /></Base>} />
          <Route path='/dealer-packages' element={<Base><DealerPackages /></Base>} />
          <Route path='/package-detail/:id' element={<Base><PackageDetail /></Base>} />
          <Route path='/payment-receipt/:id' element={<Base><PaymentReceipt /></Base>} />

          {/* Auth Routes */}
          <Route path='/signup' element={<Auth />} />
          <Route path='/signin' element={<Auth />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />


          {/* User Routes */}
          <Route path='/profile' element={<Base><Profile /></Base>} />
          <Route path='/my-ads' element={<Base><MyAds /></Base>} />
          <Route path='/my-packages' element={<Base><MyPackages /></Base>} />
          <Route path='/boost-ad' element={<Base><BoostAd /></Base>} />
          <Route path='/boost-ad' element={<Base><BoostAd /></Base>} />
          <Route path='/edit-ad/:id' element={<Base><EditAd /></Base>} />
          <Route path='/edit-car/:id' element={<Base><EditAd /></Base>} />
          <Route path='/edit-bike/:id' element={<Base><EditAd /></Base>} />
          <Route path='/edit-auto-part/:id' element={<Base><EditAd /></Base>} />
          <Route path='/edit-rent-car/:id' element={<Base><EditAd /></Base>} />

          {/* 404 Page */}
          <Route path='*' element={<PageNotFound404 />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
