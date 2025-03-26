module Chat
  class Channel < ApplicationRecord
    self.table_name = 'channels'

    validates :key, presence: true
    validates :key, uniqueness: true
    validates :private, inclusion: { in: [true, false] }

    has_many :messages

    scope :public_channels, -> { where(private: false) }
    scope :private_channels, -> { where(private: true) }
  end
end
