class PrivateChannel < ActionCable::Channel::Base
  def subscribed
    reject_unauthorized_connection unless params[:channel_name] == "user_id_#{current_user.id}"

    stream_from "private_channel_#{params[:channel_name]}"
    transmit "Listening to private channel: #{current_user.nickname}"
  end
end
