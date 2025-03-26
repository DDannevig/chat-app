class PublicChannel < ActionCable::Channel::Base
  def subscribed
    stream_from "public_channel_#{params[:channel_name]}"
    transmit "Welcome, #{current_user.nickname}!"
  end
end
