# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      # POST api/v1/user
      def create
        user = User.create!(create_params)
        File.open("#{user.email}.txt", 'w') do |f|
          f.write(Rails.application.routes.url_helpers.user_confirmation_url(confirmation_token: user.confirmation_token, host: 'localhost:3000'))
         end
      
        render json: user, serializer: UserSerializer
      end

      # POST api/v1/user/:user_id/validation
      def validation
        user.confirm
        render json: user, serializer: UserSerializer
      end
    
      private

      def user
        @user ||= User.find(params[:user_id])
      end

      def create_params
        params.require(%i[email password nickname])
        params.permit(%i[email password nickname]).to_h
      end
    end
  end
end
