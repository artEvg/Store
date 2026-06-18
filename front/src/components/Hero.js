import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  desktop: {
    breakpoint: { max: 2000, min: 524 },
    items: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

function Hero({ deviceType = "desktop" }) {
  return (
    <div className="mt-16 px-2 md:px-4">
      <Carousel
        responsive={responsive}
        ssr={true}
        infinite={true}
        autoPlay={deviceType !== "mobile"}
        autoPlaySpeed={4000}
        keyBoardControl={true}
        transitionDuration={500}
        showDots={true}
        arrows={false}
        swipeable={true}
        draggable={true}
        dotListClass="custom-dot-list-style"
        containerClass="rounded-xl overflow-hidden shadow-md"
      >
        <div className="relative h-[154px] sm:h-[196px] md:h-[245px] lg:h-[315px]">
          <img
            src="/img_1.jpg"
            alt="Баннер 1"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative h-[154px] sm:h-[196px] md:h-[245px] lg:h-[315px]">
          <img
            src="/img_2.jpg"
            alt="Баннер 2"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative h-[154px] sm:h-[196px] md:h-[245px] lg:h-[315px]">
          <img
            src="/img_3.jpg"
            alt="Баннер 3"
            className="w-full h-full object-cover"
          />
        </div>
      </Carousel>
    </div>
  );
}

export default Hero;
