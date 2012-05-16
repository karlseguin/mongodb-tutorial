class DatabaseController < ApplicationController
    before_filter :load_context
  def connect
    return hacker
  end
  
  def noop
    render :json => {:ok => true}
  end
    
  def use
    return hacker if params[:name] != @context.key
    render :json => 
    {
      :name => params[:name], 
      :collections => @context.collection_names
    }
  end
  
  def quit
    cookies.delete :context
    render :json => {:ok => true}, :layout => false
  end
  
  def list_databases
    render :json => @context.database_names
  end
  
  def collections
    render :json => @context.collection_names
  end
  
  def stats
    render :json => @context.to_database.stats(); 
  end
  
  def get_last_error
    render :json => @context.to_database.get_last_error
  end
  
end