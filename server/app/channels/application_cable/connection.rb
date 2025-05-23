module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    def receive(data)
      parsed_data = JSON.parse(data)
      return super if parsed_data['command'].present?

      case parsed_data['action']
      when 'retrieve_public_channels'
        retrieve_public_channels
      when 'retrieve_channel_users'
        retrieve_channel_users(parsed_data['key'])
      when 'create_public_channel'
        create_public_channel(parsed_data['key'])
      when 'send_public_message'
        send_public_message(parsed_data['key'], parsed_data['message'])
      when 'send_private_message'
        send_private_message(parsed_data['key'], parsed_data['message'])
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
      @decoded_auth_token ||= decode_token.first
    end

    def decode_token
      JWT.decode(authorization_token, Rails.application.secrets.secret_key_base)
    rescue 
      reject_unauthorized_connection
    end

    def authorization_token
      auth_token = request.headers['Authorization'].presence || request.params['authorization']
      auth_token.split(' ').last
    end

    def retrieve_public_channels
      public_channels = Chat::Channel.public_channels.map { |channel| { id: channel.id, key: channel.key } }

      transmit({ type: 'public_channels', public_channels: public_channels })
    end

    def create_public_channel(key)
      channel = Chat::Channel.new(key: key)
      return transmit({ error: "Invalid key: #{key}" }) unless channel.save

      transmit({ channel_id: channel.id })
    end

    def send_public_message(key, message)
      channel = Chat::Channel.public_channels.find_by(key: key)
      return transmit({ error: "Invalid key: #{key}" }) if channel.blank?
      return transmit({ error: "Unsubscribed user" }) unless subscribed_user?(key)

      Chat::Message.create(channel: channel, message: message, user: current_user)
    end

    def send_private_message(user_id, message)
      channel = Chat::Channel.private_channels.find_by(key: "user_id_#{user_id}")
      return transmit({ error: "Invalid user_id: #{key}" }) if channel.blank?

      Chat::Message.create(channel: channel, message: message, user: current_user)
    end

    def subscribed_user?(key)
      self.subscriptions.identifiers.any? do |unparsed_identifier|
        identifier = JSON.parse(unparsed_identifier)
        identifier['channel_name'] == key
      end
    end

    def retrieve_channel_users(key)
      users = ActionCable.server.pubsub.redis_connection_for_subscriptions.smembers("active_on_channel_#{key}")
      
      transmit({ key: key, users: users })
    end
  end
end
