module Chat
  class Message < ApplicationRecord
    self.table_name = 'messages'
    
    validates :message, presence: true

    belongs_to :user
    belongs_to :channel

    after_create :broadcast_message

    private

    def broadcast_message
      channel.private ? message('private') : message('public')
    end

    def message(type)
      ActionCable.server.broadcast("#{type}}_channel_#{channel.key}", action_cable_message(type))
    end

    def action_cable_message(type)
      { type: type, user: user.nickname, message: message, key: channel.key, created_at: created_at }
    end 
  end
end
