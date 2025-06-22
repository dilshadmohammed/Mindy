import { Link } from 'react-router-dom';
import api from '../axios/api';

function LandingPage() {
	const handleGoogleLogin = async () => {
		try {
			const response = await api.get('/users/google/login');
			const authUrl = response.data?.auth_url;
			if (authUrl) {
				window.location.href						= authUrl;
			} else {
				console.error('Authentication URL not found');
			}
		} catch (error) {
			console.error('Error during Google login:', error);
		}
	};


  return (
	<div className="w-full min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
	  <nav className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-green-100">
	    <div className="max-w-7xl mx-auto flex items-center justify-between">
	      <div className="flex items-center space-x-3">
	        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
	          <span className="material-symbols-outlined text-white text-xl">psychology</span>
	        </div>
	        <span className="text-2xl font-bold text-green-800">MindyBot</span>
	      </div>
	      <div className="hidden md:flex items-center space-x-8">
	        <a href="#features" className="text-green-700 hover:text-green-900 transition-colors duration-200">Features</a>
	        <a href="#about" className="text-green-700 hover:text-green-900 transition-colors duration-200">About</a>
	        <a href="#contact" className="text-green-700 hover:text-green-900 transition-colors duration-200">Contact</a>
	      </div>
	      <button className="md:hidden p-2 rounded-lg hover:bg-green-100 transition-colors duration-200">
	        <span className="material-symbols-outlined text-green-700">menu</span>
	      </button>
	    </div>
	  </nav>
	
	  <main className="max-w-7xl mx-auto px-6 py-12">
	    <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
	      <div className="space-y-8">
	        <div className="space-y-4">
	          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
	            <span className="material-symbols-outlined text-green-600 text-sm mr-2">verified</span>
	            <span className="text-green-700 text-sm font-medium">Trusted by thousands</span>
	          </div>
	          <h1 className="text-4xl md:text-6xl font-bold text-green-900 leading-tight">
	            Your Mental Health
	            <span className="text-green-600 block">Companion</span>
	          </h1>
	          <p className="text-xl text-green-700 leading-relaxed">
	            Get personalized mental health support 24/7 with our AI-powered chatbot. 
	            Safe, confidential, and always here when you need it most.
	          </p>
	        </div>
	
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
					<button
						className="w-full md:w-auto group bg-white border-2 border-gray-200 rounded-xl px-8 py-4 flex items-center justify-center space-x-3 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
						onClick={handleGoogleLogin}
					>
						<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-6 h-6" />
						<span className="text-gray-700 font-semibold group-hover:text-green-700 transition-colors duration-200">Continue with Google</span>
					</button>
					<Link className="w-full md:w-auto group bg-green-500 border-2 border-green-500 rounded-xl px-8 py-4 flex items-center justify-center space-x-3 text-white font-semibold hover:bg-green-600 hover:border-green-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
						to={'/demo-chat'}
					>
						<span className="material-symbols-outlined">play_circle</span>
						<span>Try Demo</span>
					</Link>
                </div>
                <div className="flex items-center space-x-4 text-sm text-green-600">
                    <div className="flex items-center space-x-1">
                        <span className="material-symbols-outlined text-green-500">lock</span>
                        <span>100% Private</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="material-symbols-outlined text-green-500">schedule</span>
                        <span>24/7 Available</span>
                    </div>
                </div>
            </div>
	        <div className="grid grid-cols-3 gap-8 pt-8">
	          <div className="text-center">
	            <div className="text-3xl font-bold text-green-800">50k+</div>
	            <div className="text-green-600 text-sm">Users Helped</div>
	          </div>
	          <div className="text-center">
	            <div className="text-3xl font-bold text-green-800">24/7</div>
	            <div className="text-green-600 text-sm">Support</div>
	          </div>
	          <div className="text-center">
	            <div className="text-3xl font-bold text-green-800">100%</div>
	            <div className="text-green-600 text-sm">Confidential</div>
	          </div>
	        </div>
	      </div>
	
	      <div className="relative">
	        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
	          <div className="space-y-6">
	            <div className="flex items-center space-x-3 pb-4 border-b border-green-100">
	              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
	                <span className="material-symbols-outlined text-white">smart_toy</span>
	              </div>
	              <div>
	                <div className="font-semibold text-green-900">MindyBot Assistant</div>
	                <div className="text-sm text-green-600">Online now</div>
	              </div>
	            </div>
	
	            <div className="space-y-4">
	              <div className="flex justify-start">
	                <div className="bg-green-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
	                  <p className="text-green-800">Hi there! I'm here to support you. How are you feeling today?</p>
	                </div>
	              </div>
	              
	              <div className="flex justify-end">
	                <div className="bg-green-500 rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
	                  <p className="text-white">I've been feeling a bit anxious lately. Can you help?</p>
	                </div>
	              </div>
	              
	              <div className="flex justify-start">
	                <div className="bg-green-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
	                  <p className="text-green-800">Of course! I'm here to listen and provide support. Let's explore some techniques together.</p>
	                </div>
	              </div>
	            </div>
	
	            <div className="flex items-center space-x-3 pt-4 border-t border-green-100">
	              <div className="flex-1 bg-gray-100 rounded-full px-4 py-3">
	                <span className="text-gray-500">Type your message...</span>
	              </div>
	              <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-200">
	                <span className="material-symbols-outlined text-white">send</span>
	              </button>
	            </div>
	          </div>
	        </div>
	
	        <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-300 rounded-3xl transform -rotate-2 -z-10"></div>
	        <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-emerald-400 rounded-3xl transform -rotate-6 -z-20"></div>
	      </div>
	    </div>
	
	    <section id="features" className="py-20">
	      <div className="text-center mb-16">
	        <h2 className="text-4xl font-bold text-green-900 mb-4">Why Choose MindyBot?</h2>
	        <p className="text-xl text-green-700 max-w-3xl mx-auto">
	          Our AI-powered mental health companion provides personalized support when you need it most.
	        </p>
	      </div>
	
	      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
	        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
	          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
	            <span className="material-symbols-outlined text-green-600 text-2xl">psychology</span>
	          </div>
	          <h3 className="text-2xl font-bold text-green-900 mb-4">AI-Powered Support</h3>
	          <p className="text-green-700 leading-relaxed">
	            Advanced AI technology trained on mental health best practices to provide personalized guidance and support.
	          </p>
	        </div>
	
	        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
	          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
	            <span className="material-symbols-outlined text-green-600 text-2xl">schedule</span>
	          </div>
	          <h3 className="text-2xl font-bold text-green-900 mb-4">24/7 Availability</h3>
	          <p className="text-green-700 leading-relaxed">
	            Get support whenever you need it. Our chatbot is available around the clock, ready to help you through difficult moments.
	          </p>
	        </div>
	
	        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
	          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
	            <span className="material-symbols-outlined text-green-600 text-2xl">shield</span>
	          </div>
	          <h3 className="text-2xl font-bold text-green-900 mb-4">Complete Privacy</h3>
	          <p className="text-green-700 leading-relaxed">
	            Your conversations are completely confidential and secure. We prioritize your privacy and never share your data.
	          </p>
	        </div>
	
	        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
	          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
	            <span className="material-symbols-outlined text-green-600 text-2xl">favorite</span>
	          </div>
	          <h3 className="text-2xl font-bold text-green-900 mb-4">Emotional Support</h3>
	          <p className="text-green-700 leading-relaxed">
	            Receive empathetic responses and emotional validation during challenging times with our compassionate AI.
	          </p>
	        </div>
	
	        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
	          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
	            <span className="material-symbols-outlined text-green-600 text-2xl">trending_up</span>
	          </div>
	          <h3 className="text-2xl font-bold text-green-900 mb-4">Progress Tracking</h3>
	          <p className="text-green-700 leading-relaxed">
	            Monitor your mental health journey with insights and progress tracking to see how you're improving over time.
	          </p>
	        </div>
	
	        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
	          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
	            <span className="material-symbols-outlined text-green-600 text-2xl">self_improvement</span>
	          </div>
	          <h3 className="text-2xl font-bold text-green-900 mb-4">Coping Strategies</h3>
	          <p className="text-green-700 leading-relaxed">
	            Learn effective coping mechanisms and mindfulness techniques tailored to your specific needs and situations.
	          </p>
	        </div>
	      </div>
	    </section>
	
	    <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl my-20">
	      <div className="text-center px-8">
	        <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
	        <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
	          Join thousands of users who have found support and guidance through MindBot. Your mental health matters.
	        </p>
	        <button className="bg-white text-green-600 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg inline-flex items-center space-x-3"
				onClick={handleGoogleLogin}
			>
			  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-6 h-6" />
	          <span>Get Started with Google</span>
	        </button>
	      </div>
	    </section>
	  </main>
	
	  <footer className="bg-green-900 text-green-100 py-12">
	    <div className="max-w-7xl mx-auto px-6">
	      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
	        <div className="space-y-4">
	          <div className="flex items-center space-x-3">
	            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
	              <span className="material-symbols-outlined text-white text-xl">psychology</span>
	            </div>
	            <span className="text-2xl font-bold">MindyBot</span>
	          </div>
	          <p className="text-green-300">
	            Your trusted AI companion for mental health support and guidance.
	          </p>
	        </div>
	
	        <div className="space-y-4">
	          <h4 className="text-lg font-semibold">Product</h4>
	          <div className="space-y-2">
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">Features</a>
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">How it Works</a>
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">Pricing</a>
	          </div>
	        </div>
	
	        <div className="space-y-4">
	          <h4 className="text-lg font-semibold">Support</h4>
	          <div className="space-y-2">
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">Help Center</a>
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">Contact Us</a>
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">Crisis Resources</a>
	          </div>
	        </div>
	
	        <div className="space-y-4">
	          <h4 className="text-lg font-semibold">Legal</h4>
	          <div className="space-y-2">
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">Privacy Policy</a>
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">Terms of Service</a>
	            <a href="#" className="block text-green-300 hover:text-white transition-colors duration-200">HIPAA Compliance</a>
	          </div>
	        </div>
	      </div>
	
	      <div className="border-t border-green-800 mt-12 pt-8 text-center">
	        <p className="text-green-400">
	          © 2025 MindyBot. All rights reserved. Not a replacement for professional medical advice.
	        </p>
	      </div>
	    </div>
	  </footer>
	</div>
  )
}

export default LandingPage

