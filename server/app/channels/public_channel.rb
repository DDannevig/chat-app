class PublicChannel < ActionCable::Channel::Base
  def subscribed
    reject unless channel.present?

    stream_from "public_channel_#{params[:channel_name]}"
    add_active_user_to_channel

    last_messages = channel.messages.order(created_at: :desc).limit(5).reverse
    serialized_messages = ActiveModelSerializers::SerializableResource.new(
                          last_messages, each_serializer: MessageSerializer)

    transmit({type: 'last_messages', last_messages: serialized_messages.as_json})
    broadcast_new_user
  end

  def unsubscribed
    remove_active_user_from_channel
    broadcast_user_left
  end

  private

  def channel
    @channel ||= Chat::Channel.public_channels.find_by(key: params[:channel_name])
  end

  def add_active_user_to_channel
    ActionCable.server.pubsub.redis_connection_for_subscriptions.sadd(
      "active_on_channel_#{params[:channel_name]}",
      current_user.id, current_user.nickname
    )
  end

  def remove_active_user_from_channel
    ActionCable.server.pubsub.redis_connection_for_subscriptions.srem(
      "active_on_channel_#{params[:channel_name]}",
      current_user.id, current_user.nickname
    )
  end

  def broadcast_new_user
    message = { type: 'welcome', message: "Welcome, #{current_user.nickname}!" }
    ActionCable.server.broadcast("public_channel_#{channel.key}", message)
  end

  def broadcast_user_left
    message = { type: 'goodbye', message: "#{current_user.nickname} has left the channel." }
    ActionCable.server.broadcast("public_channel_#{channel.key}", message)
  end
end
