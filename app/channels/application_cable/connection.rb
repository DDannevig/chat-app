module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      # por default deberia subscribirlo al del usuario
    end

    def receive(data)
      parsed_data = JSON.parse(data)
      return super if parsed_data['command'].present?

      case parsed_data['action']
      when 'retrieve_public_channels'
        retrieve_public_channels
      when 'retrieve_channel_users'
        retrieve_public_channels
      when 'create_public_channel'
        create_public_channel(parsed_data['key'])
      when 'send_public_message'
        retrieve_public_channels
      when 'send_private_message'
        retrieve_public_channels
      else
        transmit({ error: "Unknown action: #{parsed_data['action']}" })
      end
    end

    private

    def find_verified_user
      verified_user.presence || reject_unauthorized_connection
    end

    def verified_user
      @verified_user ||= User.confirmed.find_by(id: decoded_auth_token['user_id'])
    end

    def decoded_auth_token
      @decoded_auth_token ||= JWT.decode(authorization_header, Rails.application.secrets.secret_key_base).first
    end

    def authorization_header
      reject_unauthorized_connection if request.headers['Authorization'].blank?
      request.headers['Authorization'].split(' ').last
    end

    def retrieve_public_channels
      public_channels = Chat::Channel.public_channels.map { |channel| { id: channel.id, key: channel.key } }

      transmit({ public_channels: public_channels })
    end

    def create_public_channel(key)
      new_channel = Chat::Channel.new(key: key)
      return transmit({ error: "Invalid key: #{key}" }) unless new_channel.save

      transmit({ channel_id: new_channel.id })
    end
  end
end
