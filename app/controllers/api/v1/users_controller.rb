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

      # POST api/v1/user/sessions
      def sessions
        return head :unauthorized unless user_by_email.valid_password?(params.require(:password))
        render json: sessions_response
      end
    
      private

      def user
        @user ||= User.find(params[:user_id])
      end

      def user_by_email
        @user_by_email ||= User.find_by!(email: params.require(:email))
      end

      def token_payload
        { user_id: user_by_email.id,
          expiration: 24.hours.from_now }
      end

      def create_params
        params.require(%i[email password nickname])
        params.permit(%i[email password nickname]).to_h
      end

      def sessions_params
        params.require(%i[email password])
        params.permit(%i[email password]).to_h
      end

      def sessions_response
        { token: JWT.encode(token_payload, Rails.application.secrets.secret_key_base),
          expiration: token_payload[:expiration] }
      end
    end
  end
end
