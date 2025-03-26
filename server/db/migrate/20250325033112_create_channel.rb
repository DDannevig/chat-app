class CreateChannel < ActiveRecord::Migration[7.1]
  def change
    create_table :channels do |t|
      t.string :key, null: false
      t.boolean :private, null: false, default: false

      t.timestamps
    end
  end
end
