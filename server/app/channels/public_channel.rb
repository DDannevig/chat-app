class PublicChannel < ActionCable::Channel::Base
  def subscribed
    reject unless channel.present?

    stream_from "public_channel_#{params[:channel_name]}"
    add_active_user_to_channel
    transmit({ type: 'welcome', message: "Welcome, #{current_user.nickname}!" })
  end

  def unsubscribed
    remove_active_user_from_channel
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
end
