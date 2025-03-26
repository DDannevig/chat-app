class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :nickname, :confirmed?
end
