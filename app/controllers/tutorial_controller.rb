class TutorialController < ApplicationController
  before_filter :load_context
  def index
    @context = Context.new
    cookies.signed[:context] = {:value => Marshal.dump(@context), :expires => 2.hour.from_now}
    Lesson.start(@context)
    Lesson.reset(0, @context)
    @databases = @context.database_names.to_json
  end
  def reset
    Lesson.reset(params[:index].to_i, @context)
    render :nothing => true
  end
end