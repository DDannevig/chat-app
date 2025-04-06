module Chat
  class Message < ApplicationRecord
    self.table_name = 'messages'
    
    validates :message, presence: true

    belongs_to :user
    belongs_to :channel

    after_create :broadcast_message

    private

    def broadcast_message
      channel.private ? format_message('private') : format_message('public')
    end

    def format_message(type)
      ActionCable.server.broadcast("#{type}_channel_#{channel.key}", action_cable_message)
    end

    def action_cable_message
      { user: user.nickname, message: message, created_at: created_at, type: 'message' }
    end 
  end
end
