class MessageSerializer < ActiveModel::Serializer
  attributes :message, :created_at, :user, :type

  def user
    object.user.nickname
  end

  def type
    'message'
  end
end
