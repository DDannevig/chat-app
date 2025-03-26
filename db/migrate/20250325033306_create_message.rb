class CreateMessage < ActiveRecord::Migration[7.1]
  def change
    create_table :messages do |t|
      t.references :user, foreign_key: true, null: false
      t.references :channel, foreign_key: true, null: false
      t.string :message, null: false

      t.timestamps
    end
  end
end
