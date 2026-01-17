import { useState, useEffect } from 'react'
import { getFeatured } from '../../services/image.js'
import './FeaturedImages.css';

const FeaturedImages = () => {
  const [images, setImages] = useState([])

  useEffect(() => {
    getFeatured().then(imgs => setImages(imgs))
  }, [])

  return (
    <div className='featured-container'>
      <h1 className='featured-title'>Featured Images</h1>
      {images.length === 0 ? (
        <div className='no-images'><i>No images to speak of...</i></div>
      ) : (
        <div className='image-grid'>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt='featured'
              className='featured-image'
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FeaturedImages
