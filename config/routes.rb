Rails.application.routes.draw do
  devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
  
  mount ActionCable.server => '/cable'

  namespace :api do
    namespace :v1 do    
      resources :users, only: :create do
        post :validation
        collection do
          post :sessions
        end
      end
    end
  end
end
