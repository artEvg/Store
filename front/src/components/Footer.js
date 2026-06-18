import React from "react"

function Footer() {
	return (
		<footer className='bg-gray-50 border-t mt-16'>
			<div className='max-w-7xl mx-auto px-6 py-8'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
					{/* Логотип */}
					<div>
						<h2 className='text-2xl font-black text-[#F86D72] tracking-wider'>
							BUBA
						</h2>
						<p className='text-sm text-gray-500 mt-2'>
							Интернет-магазин спортивных товаров с лучшими предложениями и
							скидками.
						</p>
					</div>

					{/* Информация */}
					{/* <div>
            <h3 className="text-base font-semibold mb-3 before:hidden">
              Информация
            </h3>

            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/" className="hover:text-[#F86D72]">
                  Главная
                </a>
              </li>

              <li>
                <a href="/" className="hover:text-[#F86D72]">
                  Каталог
                </a>
              </li>

              <li>
                <a href="/" className="hover:text-[#F86D72]">
                  О нас
                </a>
              </li>
            </ul>
          </div> */}

					{/* Покупателям */}
					{/* <div>
            <h3 className="text-base font-semibold mb-3 before:hidden">
              Покупателям
            </h3>

            <ul className="space-y-2 text-sm text-gray-600">
              <li>Доставка</li>
              <li>Оплата</li>
              <li>Возврат товара</li>
            </ul>
          </div> */}

					{/* Контакты */}
					<div>
						<h3 className='text-base font-semibold mb-3 before:hidden'>
							Контакты
						</h3>

						<ul className='space-y-2 text-sm text-gray-600'>
							<li>+7 (999) 123-45-67</li>
							<li>info@buba.ru</li>
							<li>Владивосток, ул. Примерная 123, Россия</li>
						</ul>
					</div>
				</div>

				<hr className='my-6' />

				<div className='text-center text-sm text-gray-500'>
					© 2026 BUBA™. Все права защищены.
				</div>
			</div>
		</footer>
	)
}

export default Footer
