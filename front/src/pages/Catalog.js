import React from "react"
import FeaturedProducts from "../components/FeaturedProducts"
import OnSaleProducts from "../components/OnSaleProducts"
import DiscountPercent from "../components/DiscountPercent"

function Catalog() {
	return (
		<div className='p-6 lg:p-10 lg:px-52'>
			<FeaturedProducts />
			<OnSaleProducts />
			<DiscountPercent />
		</div>
	)
}

export default Catalog
