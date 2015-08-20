<div class="languages">
	<div class="row">
		<div class="col-xs-2">Language Settings</div>
		<div class="col-xs-10">
			<p>
				The default language determines the language settings for all users who
				are visiting your forum. <br />
				Individual users can override the default language on their account settings page.
			</p>

			<form class="row">
				<div class="form-group col-sm-6">
					<label for="defaultLang">Default Language</label>
					<select id="language" data-field="defaultLang" class="form-control">
						<!-- BEGIN languages -->
						<option value="{languages.code}" <!-- IF languages.selected -->selected<!-- ENDIF languages.selected -->>{languages.name} ({languages.code})</option>
						<!-- END languages -->
					</select>
				</div>
			</form>
		</div>
	</div>
</div>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>