import React from "react"
import { ShoppingCart, BadgeCheck, Tag, ShieldCheck } from "lucide-react"
function Highlights() {
	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 mb-12 '>
			<div className='flex items-start mt-5 gap-4  max-w-md w-full mx-auto'>
				<ShoppingCart className='text-[#F86D72] w-8 h-8 shrink-0' />
				<div>
					<h4 className='font-semibold'>Бесплатная Доставка</h4>
					<p className='text-sm text-gray-600'>
						Наслаждайтесь быстрой и бесплатной доставкой всех ваших заказов без
						каких-либо дополнительных затрат.
					</p>
				</div>
			</div>

			{/* Feature 2 */}
			<div className='flex items-start gap-3 mt-5 max-w-md w-full mx-auto'>
				<BadgeCheck className='text-[#F86D72] w-8 h-8 shrink-0' />
				<div>
					<h4 className='font-semibold'>Гарантия качества</h4>
					<p className='text-sm text-gray-600'>
						Мы гарантируем высочайшее качество каждого продукта, которые мы
						предлагаем.
					</p>
				</div>
			</div>

			{/* Feature 3 */}
			<div className='flex items-start gap-3 mt-5 max-w-md w-full mx-auto'>
				<Tag className='text-[#F86D72] w-8 h-8 shrink-0' />
				<div>
					<h4 className='font-semibold'>Ежедневные предложения</h4>
					<p className='text-sm text-gray-600'>
						Каждый день открывайте для себя новые предложения и скидки на лучшие
						товары.
					</p>
				</div>
			</div>

			{/* Feature 4 */}
			<div className='flex items-start mt-5 gap-3 max-w-md w-full mx-auto'>
				<ShieldCheck className='text-[#F86D72] w-8 h-8 shrink-0' />
				<div>
					<h4 className='font-semibold'>100% Безопасный платеж</h4>
					<p className='text-sm text-gray-600'>
						Ваши платежи полностью защищены благодаря безопасному и надежному
						оформлению заказа.
					</p>
				</div>
			</div>
		</div>
	)
}

export default Highlights
