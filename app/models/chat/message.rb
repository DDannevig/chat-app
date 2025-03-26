module Chat
  class Message < ApplicationRecord
    self.table_name = 'messages'
    
    validates :message, presence: true

    belongs_to :user
    belongs_to :channel

    after_create :broadcast_message

    private

    def broadcast_message
      channel.private ? private_message : public_message
    end

    def private_message
      ActionCable.server.broadcast("private_channel_#{channel.key}", action_cable_message)
    end
    
    def public_message
      ActionCable.server.broadcast("public_channel_#{channel.key}", action_cable_message)
    end

    def action_cable_message
      { user: user.nickname, message: message, key: channel.key }
    end 
  end
end
