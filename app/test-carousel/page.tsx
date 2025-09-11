'use client'

import ContentCarousel from '@/components/ContentCarousel'

export default function TestCarouselPage() {
  console.log('🧪 TestCarouselPage: Component rendering')
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Carousel Test Page</h1>
      <div className="max-w-4xl mx-auto">
        <ContentCarousel
          autoPlay={false}
          showDots={true}
          showArrows={true}
          aspectRatio="wide"
          className="border-2 border-red-500"
        />
      </div>
    </div>
  )
}