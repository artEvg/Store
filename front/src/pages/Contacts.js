import React from "react"
import { Phone, Mail, MapPin, Send } from "lucide-react"

function Contacts() {
	const handleSubmit = e => {
		e.preventDefault()
		alert("Ваша сообщение отправлено! Спасибо.")
	}

	return (
		<div className='pt-24 p-6 lg:pt-28 lg:p-10 lg:px-52'>
			<h1 className='text-3xl font-bold mb-6'>Контакты</h1>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
				<div>
					<h2 className='text-2xl font-semibold mb-4'>Свяжитесь с нами</h2>
					<p className='text-gray-600 mb-6'>
						Мы всегда рады помочь вам! Несмотря на то, что мы не работаем
						напрямую с физическими клиентами, вы можете обратиться к нам для
						обсуждения сотрудничества.
					</p>

					<div className='space-y-4'>
						<div className='flex items-start gap-3'>
							<Phone className='text-[#F86D72] w-6 h-6 shrink-0' />
							<div>
								<h3 className='font-semibold'>Телефон</h3>
								<p className='text-gray-600'>+7 (999) 123-45-67</p>
							</div>
						</div>

						<div className='flex items-start gap-3'>
							<Mail className='text-[#F86D72] w-6 h-6 shrink-0' />
							<div>
								<h3 className='font-semibold'>Email</h3>
								<p className='text-gray-600'>info@buba.ru</p>
							</div>
						</div>

						<div className='flex items-start gap-3'>
							<MapPin className='text-[#F86D72] w-6 h-6 shrink-0' />
							<div>
								<h3 className='font-semibold'>Адрес</h3>
								<p className='text-gray-600'>Владивосток, ул. Примерная 123</p>
							</div>
						</div>
					</div>

					<div className='mt-8 bg-gray-100 p-4 rounded-lg'>
						<h3 className='font-semibold mb-2'>Важная информация</h3>
						<p className='text-sm text-gray-600'>
							❤️ Мы не работаем напрямую с физическими клиентами. Все
							предложения от частных лиц могут быть рассмотрены только в рамках
							партнёрского сотрудничества.
						</p>
					</div>
				</div>

				<div>
					<h2 className='text-2xl font-semibold mb-4'>Напишите нам</h2>
					<form
						onSubmit={handleSubmit}
						className='space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-1'>Ваше имя</label>
							<input
								type='text'
								name='name'
								required
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F86D72] focus:border-transparent'
								placeholder='Введите ваше имя'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium mb-1'>Email</label>
							<input
								type='email'
								name='email'
								required
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F86D72] focus:border-transparent'
								placeholder='Введите ваш Email'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium mb-1'>
								Телефон (опционально)
							</label>
							<input
								type='tel'
								name='phone'
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F86D72] focus:border-transparent'
								placeholder='Введите ваш телефон'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium mb-1'>
								Сообщение
							</label>
							<textarea
								name='message'
								required
								rows='5'
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F86D72] focus:border-transparent'
								placeholder='Введите ваше сообщение'
							/>
						</div>

						<button
							type='submit'
							className='w-full bg-[#F86D72] text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#e55a60] transition-colors'>
							<Send className='w-5 h-5' />
							Отправить сообщение
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Contacts
