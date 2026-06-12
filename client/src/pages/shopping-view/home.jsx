import { Button } from '@/components/ui/button'
import bannerOne from '../../assets/banner-1.webp'
import bannerTwo from '../../assets/banner-2.webp'
import bannerThree from '../../assets/banner-3.webp'
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from '@/store/shop/products-slice'
import ShoppingProductTile from '@/components/shopping-view/product-tile'
import { useNavigate } from 'react-router-dom'
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice'
import { useToast } from '@/components/ui/use-toast'
import ProductDetailsDialog from '@/components/shopping-view/product-details'
import { getFeatureImages } from '@/store/common-slice'

const categoriesWithIcon = [
  { id: 'men', label: 'Men', icon: ShirtIcon },
  { id: 'women', label: 'Women', icon: CloudLightning },
  { id: 'kids', label: 'Kids', icon: BabyIcon },
  { id: 'accessories', label: 'Accessories', icon: WatchIcon },
  { id: 'footwear', label: 'Footwear', icon: UmbrellaIcon },
]

const brandsWithIcon = [
  { id: 'nike', label: 'Nike', icon: Shirt },
  { id: 'adidas', label: 'Adidas', icon: WashingMachine },
  { id: 'puma', label: 'Puma', icon: ShoppingBasket },
  { id: 'levi', label: "Levi's", icon: Airplay },
  { id: 'zara', label: 'Zara', icon: Images },
  { id: 'h&m', label: 'H&M', icon: Heater },
]
// Default banner images fallback
const defaultBanners = [bannerOne, bannerTwo, bannerThree]

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts,
  )
  const { featureImageList } = useSelector((state) => state.commonFeature)

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)

  const { user } = useSelector((state) => state.auth)

  // Use featureImageList if available, otherwise use default banners
  const banners =
    featureImageList && featureImageList.length > 0
      ? featureImageList
      : defaultBanners.map((img) => ({ image: img }))

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem('filters')
    const currentFilter = {
      [section]: [getCurrentItem.id],
    }

    sessionStorage.setItem('filters', JSON.stringify(currentFilter))
    navigate(`/shop/listing`)
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId))
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id))
        toast({
          title: 'Product is added to cart',
        })
      }
    })
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true)
  }, [productDetails])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length)
    }, 15000)

    return () => clearInterval(timer)
  }, [banners.length])

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: 'price-lowtohigh',
      }),
    )
  }, [dispatch])

  console.log(productList, 'productList')

  useEffect(() => {
    dispatch(getFeatureImages())
  }, [dispatch])

  const [activeTab, setActiveTab] = useState('featured')

  // Filter products for tabs (simulated for now)
  const featuredProducts = productList?.slice(0, 8) || []
  const newArrivals = [...(productList || [])].reverse().slice(0, 8)
  const bestSellers = [...(productList || [])].sort((a, b) => b.price - a.price).slice(0, 8)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[500px] md:h-[650px] overflow-hidden group">
        {banners && banners.length > 0
          ? banners.map((slide, index) => (
            <div
              key={index}
              className={`${index === currentSlide ? 'opacity-100' : 'opacity-0'
                } absolute inset-0 transition-opacity duration-1000 ease-in-out`}
            >
              <img
                src={slide?.image}
                className="w-full h-full object-cover"
                alt={`Banner ${index + 1}`}
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <h3 className="text-lg md:text-xl font-medium tracking-widest uppercase mb-4 animate-fadeIn">
                  Premium Collection 2024
                </h3>
                <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight animate-fadeIn delay-100">
                  MODERN STYLE <br /> FOR EVERYONE
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-90 animate-fadeIn delay-200">
                  Discover the latest trends in fashion and accessories. Get up to 40% off on new arrivals.
                </p>
                <Button
                  onClick={() => navigate('/shop/listing')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-7 rounded-none transition-all duration-300 transform hover:scale-105"
                >
                  SHOP NOW
                </Button>
              </div>
            </div>
          ))
          : null}

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide - 1 + banners.length) % banners.length,
            )
          }
          className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length)
          }
          className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-primary' : 'bg-white/50'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Promo Banners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden cursor-pointer h-[350px]">
              <img
                src={bannerTwo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Promo 1"
              />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/30" />
              <div className="absolute top-1/2 left-12 transform -translate-y-1/2 bg-white/90 p-8 max-w-[250px] shadow-xl">
                <span className="text-xs font-semibold tracking-widest uppercase mb-2 block text-gray-500">New Collection</span>
                <h3 className="text-2xl font-bold mb-4">SUMMER STYLE</h3>
                <button
                  onClick={() => navigate('/shop/listing')}
                  className="text-xs font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors uppercase tracking-widest"
                >
                  SHOP NOW
                </button>
              </div>
            </div>
            <div className="relative group overflow-hidden cursor-pointer h-[350px]">
              <img
                src={bannerThree}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Promo 2"
              />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/30" />
              <div className="absolute top-1/2 left-12 transform -translate-y-1/2 bg-white/90 p-8 max-w-[250px] shadow-xl">
                <span className="text-xs font-semibold tracking-widest uppercase mb-2 block text-gray-500">Premium Brands</span>
                <h3 className="text-2xl font-bold mb-4">LUXURY ITEMS</h3>
                <button
                  onClick={() => navigate('/shop/listing')}
                  className="text-xs font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors uppercase tracking-widest"
                >
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#F4F5F7]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">Discovery</span>
            <h2 className="text-4xl font-bold text-center tracking-tight text-gray-900">Top Categories</h2>
            <div className="w-16 h-1 bg-primary mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {categoriesWithIcon.map((categoryItem) => (
              <div
                key={categoryItem.id}
                onClick={() => handleNavigateToListingPage(categoryItem, 'category')}
                className="group cursor-pointer flex flex-col items-center"
              >
                <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center mb-5 shadow-sm border border-transparent group-hover:border-primary group-hover:shadow-xl transition-all duration-500">
                  <categoryItem.icon className="w-12 h-12 text-gray-700 group-hover:text-primary transition-colors" />
                </div>
                <span className="font-bold text-gray-900 tracking-wider uppercase text-xs group-hover:text-primary transition-colors">{categoryItem.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center mb-12">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-3">Best Selection</span>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900">Trending Products</h2>
          </div>

          <div className="flex justify-center flex-wrap gap-4 md:gap-12 mb-16 px-4">
            <button
              onClick={() => setActiveTab('new')}
              className={`pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${activeTab === 'new' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-900'
                }`}
            >
              New Products
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${activeTab === 'featured' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-900'
                }`}
            >
              Featured Products
            </button>
            <button
              onClick={() => setActiveTab('best')}
              className={`pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 ${activeTab === 'best' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-gray-900'
                }`}
            >
              Best Sellers
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {(activeTab === 'new' ? newArrivals : activeTab === 'best' ? bestSellers : featuredProducts).map((productItem) => (
              <ShoppingProductTile
                key={productItem._id}
                handleGetProductDetails={handleGetProductDetails}
                product={productItem}
                handleAddtoCart={handleAddtoCart}
              />
            ))}
          </div>

          <div className="mt-20 flex justify-center">
            <Button
              onClick={() => navigate('/shop/listing')}
              variant="outline"
              className="rounded-none border-2 border-primary text-primary font-bold px-12 py-7 hover:bg-primary hover:text-white transition-all duration-500 uppercase tracking-widest text-xs"
            >
              VIEW ALL PRODUCTS
            </Button>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20 bg-[#F4F5F7] border-y border-gray-100 px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-50 hover:opacity-100 transition-opacity duration-500">
            {brandsWithIcon.map((brandItem) => (
              <div
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, 'brand')}
                className="cursor-pointer flex items-center gap-3 group grayscale hover:grayscale-0 transition-all duration-500"
              >
                <brandItem.icon className="w-8 h-8 text-gray-700 group-hover:text-primary" />
                <span className="text-xl font-black text-gray-800 tracking-tighter uppercase group-hover:text-primary">{brandItem.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  )
}

export default ShoppingHome
