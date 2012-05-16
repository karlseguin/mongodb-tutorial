require 'context'
class ApplicationController < ActionController::Base
  protect_from_forgery
  rescue_from StandardError, :with => :handle_error

  private
  def handle_error(exception)
    render :text => exception.message, :status => 500
  end
  
  def hacker
    render :text => 'this is a sandbox. stay in it (please)', :status => 403
    return
  end
  def load_context
    data = cookies.signed[:context]
    @context = Marshal.load(data) unless data.blank?
  end
  
  def missing_parameter(name)
    render :text => "missing parameter '#{name}'", :status => 500
  end
  
end
