class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable
  
  scope :confirmed, -> { where.not(confirmed_at: nil) }

  validates :nickname, presence: true
  validates :nickname, uniqueness: true

  after_create :create_private_channel
  after_destroy :destroy_private_channel

  def create_private_channel
    Chat::Channel.create(private: true, key: "user_id_#{id}")
  end

  def destroy_private_channel
    Chat::Channel.private_channels.find_by!(key: "user_id_#{id}").destroy
  end
end
